// app/api/generate/route.ts
import { requireSession } from "@/lib/auth/session";
import { ok, err } from "@/lib/api/response";
import { generateSpecFromText } from "@/lib/ai/groq";
import { getProjectById } from "@/lib/db/queries/projects";
import {
  createContract,
  getContractByProjectId,
  updateContract,
} from "@/lib/db/queries/contracts";
import { mergeSpecs, isEmptySpec } from "@/lib/ai/merge";
import { checkAiGenerationLimit, recordAiGeneration } from "@/lib/plans/usage";
import { PLAN_DISPLAY } from "@/lib/plans/limits";
import { z } from "zod";

const schema = z.object({
  projectId: z.string().min(1),
  plainEnglish: z.string().min(10).max(2000),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400);

    const { projectId, plainEnglish } = parsed.data;

    const project = await getProjectById(projectId, session.user.id);
    if (!project) return err("Project not found", "NOT_FOUND", 404);

    // ── Plan limit: AI generations ──────────────────────────────────
    const aiLimit = await checkAiGenerationLimit(session.user.id);
    if (!aiLimit.allowed) {
      return err(
        `You've used all ${aiLimit.limit} AI generations this month on the ${PLAN_DISPLAY[aiLimit.plan].label} plan. Upgrade for more.`,
        "PLAN_LIMIT_EXCEEDED",
        403
      );
    }

    const existing = await getContractByProjectId(projectId);
    const specJson = await generateSpecFromText(
      plainEnglish,
      existing && !isEmptySpec(existing.openApiSpec)
        ? (existing.openApiSpec as object)
        : undefined,
    );

    let incomingSpec: object;
    try {
      incomingSpec = JSON.parse(specJson);
    } catch {
      return err(
        "AI returned invalid JSON — try again",
        "INVALID_AI_RESPONSE",
        500,
      );
    }

    // ── Track AI generation usage ───────────────────────────────────
    await recordAiGeneration(session.user.id, projectId);

    if (!existing) {
      // No contract yet — create fresh
      const contract = await createContract(
        projectId,
        incomingSpec,
        plainEnglish,
      );
      return ok({ contract, mode: "created" });
    }

    if (isEmptySpec(existing.openApiSpec)) {
      // Contract exists but has no endpoints — replace safely
      const contract = await updateContract(existing.id, incomingSpec);
      return ok({ contract, mode: "replaced" });
    }

    // Contract has existing endpoints — merge, never destroy
    const merged = mergeSpecs(
      existing.openApiSpec as Parameters<typeof mergeSpecs>[0],
      incomingSpec as Parameters<typeof mergeSpecs>[1],
    );
    const contract = await updateContract(existing.id, merged);
    return ok({ contract, mode: "merged" });
  } catch (e) {
    return err(
      e instanceof Error ? e.message : "Generation failed",
      "GENERATION_FAILED",
      500,
    );
  }
}

