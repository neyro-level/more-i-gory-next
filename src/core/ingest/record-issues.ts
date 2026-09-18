import { createImportIssue } from "../data-access/system/create-import-issue.ts";
import type { FeedParseIssue } from "./parsers/types.ts";

export const maxImportIssuesPerRun = 100;

export type RecordedImportIssue = {
  code: string;
  externalId?: string;
  message: string;
  path?: string;
  severity: FeedParseIssue["severity"];
};

export function toRecordedImportIssue(issue: FeedParseIssue): RecordedImportIssue {
  return {
    code: issue.code,
    message: issue.message,
    severity: issue.severity,
    ...(issue.externalId ? { externalId: issue.externalId } : {}),
    ...(issue.path ? { path: issue.path } : {}),
  };
}

export function boundImportIssues(issues: readonly FeedParseIssue[]): FeedParseIssue[] {
  return issues.slice(0, maxImportIssuesPerRun);
}

export async function recordImportIssues(args: {
  feedSourceId: string;
  importRunId: string;
  issues: readonly FeedParseIssue[];
  payload: Parameters<typeof createImportIssue>[0];
}): Promise<RecordedImportIssue[]> {
  const recorded: RecordedImportIssue[] = [];

  for (const issue of boundImportIssues(args.issues)) {
    const safe = toRecordedImportIssue(issue);
    await createImportIssue(args.payload, {
      code: safe.code,
      feedSource: args.feedSourceId,
      importRun: args.importRunId,
      message: safe.message,
      severity: safe.severity,
      ...(safe.externalId ? { externalId: safe.externalId } : {}),
      ...(safe.path ? { path: safe.path } : {}),
    });
    recorded.push(safe);
  }

  return recorded;
}

export function createRecordImportIssuesHandler(deps: {
  payload: Parameters<typeof createImportIssue>[0];
}) {
  return async (context: {
    input: { feedSourceId: string; importRunId: string };
    state: {
      parse?: { issues?: FeedParseIssue[] };
      normalize?: { issues?: FeedParseIssue[] };
      recordedIssues?: RecordedImportIssue[];
    };
  }) => {
    const issues = [...(context.state.parse?.issues ?? []), ...(context.state.normalize?.issues ?? [])];
    context.state.recordedIssues = await recordImportIssues({
      feedSourceId: context.input.feedSourceId,
      importRunId: context.input.importRunId,
      issues,
      payload: deps.payload,
    });
    return { continue: true, status: "running" as const };
  };
}
