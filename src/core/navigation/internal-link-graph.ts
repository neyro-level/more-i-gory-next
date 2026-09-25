import type { PublicPropertyDTO, PublicRegionDTO } from "../dto/index.ts";
import { isDiscoverableGeoStatus } from "./public-link-policy.ts";

export type PublicLinkGraph = ReadonlyMap<string, ReadonlySet<string>>;

const coreEdges: Readonly<Record<string, readonly string[]>> = {
  "/": ["/investicionnaya-nedvizhimost/", "/obekty/", "/metodika/", "/analitika/", "/podbor/"],
  "/investicionnaya-nedvizhimost/": ["/obekty/", "/metodika/", "/podbor/"],
  "/obekty/": ["/investicionnaya-nedvizhimost/", "/analitika/", "/metodika/", "/podbor/"],
  "/analitika/": ["/investicionnaya-nedvizhimost/", "/obekty/", "/metodika/", "/podbor/"],
  "/metodika/": ["/obekty/", "/podbor/"],
  "/podbor/": ["/obekty/", "/metodika/"],
};

function addEdge(graph: Map<string, Set<string>>, from: string, to: string) {
  if (!graph.has(from)) graph.set(from, new Set());
  graph.get(from)?.add(to);
}

export function buildPublicLinkGraph(
  regions: readonly PublicRegionDTO[],
  projects: readonly PublicPropertyDTO[],
): PublicLinkGraph {
  const graph = new Map<string, Set<string>>();

  for (const [from, targets] of Object.entries(coreEdges)) {
    for (const target of targets) addEdge(graph, from, target);
  }

  const discoverableRegions = regions.filter((region) => region.status === "published");
  for (const region of discoverableRegions) {
    addEdge(graph, "/investicionnaya-nedvizhimost/", region.path);
    addEdge(graph, region.path, "/obekty/");
    addEdge(graph, region.path, "/analitika/");
    addEdge(graph, region.path, "/metodika/");
    addEdge(graph, region.path, "/podbor/");

    const parent = discoverableRegions.find((candidate) => candidate.slug === region.parentSlug);
    if (parent) addEdge(graph, region.path, parent.path);
  }

  for (const project of projects.filter((candidate) => candidate.status === "active")) {
    addEdge(graph, "/obekty/", project.path);
    addEdge(graph, project.path, "/analitika/");
    addEdge(graph, project.path, "/metodika/");
    addEdge(graph, project.path, "/podbor/");
    if (isDiscoverableGeoStatus(project.geoContext.region.status)) addEdge(graph, project.path, project.geoContext.region.path);
    if (project.geoContext.cityOrArea && isDiscoverableGeoStatus(project.geoContext.cityOrArea.status)) {
      addEdge(graph, project.path, project.geoContext.cityOrArea.path);
    }
  }

  return graph;
}

export function reachablePaths(graph: PublicLinkGraph, start = "/"): ReadonlySet<string> {
  const visited = new Set<string>();
  const pending = [start];
  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    pending.push(...(graph.get(current) ?? []));
  }
  return visited;
}
