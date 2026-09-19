export function partitionUiDriftFindings(findings) {
  return {
    blockingFindings: findings.filter((finding) => finding.severity === "P0" || finding.severity === "P1"),
    backlogFindings: findings.filter((finding) => finding.severity === "P2"),
  };
}

export function evaluateUiDriftGate(findings) {
  const { blockingFindings, backlogFindings } = partitionUiDriftFindings(findings);

  if (blockingFindings.length > 0) {
    return {
      ok: false,
      blocking: true,
      blockingFindings,
      backlogFindings,
      message: `UI drift audit failed with ${blockingFindings.length} blocking finding(s).`,
    };
  }

  return {
    ok: true,
    blocking: false,
    blockingFindings,
    backlogFindings,
    message:
      backlogFindings.length > 0
        ? "ui drift audit ok: no P0/P1 findings; P2 findings are backlog candidates."
        : "ui drift audit ok: no P0/P1 findings and no P2 backlog candidates.",
  };
}
