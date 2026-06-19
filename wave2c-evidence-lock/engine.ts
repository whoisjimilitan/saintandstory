/**
 * WAVE 2C: EVIDENCE LOCK
 *
 * MINIMAL REAL BEHAVIOR
 *
 * Generates pure structure evidence graph.
 * Links by entity overlap and sentence proximity.
 * No interpretation, structural only.
 */

export interface Observation {
  observation_id: string;
  observation_type: string;
  evidence_text: string;
  source: string;
  confidence: string;
}

export class Wave2CEngine {
  async run(input: {
    signals: Record<string, unknown>;
    observations: Observation[];
    contradictions: Array<Record<string, unknown>>;
    freshness: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    const observations = input.observations || [];

    // 1. Generate raw_facts (verbatim evidence_text only)
    const raw_facts = observations.map((obs) => ({
      observation_id: obs.observation_id,
      fact: obs.evidence_text,
    }));

    // 2. Generate observation_links (entity and sentence overlap)
    const observation_links = this.generateLinks(observations);

    // 3. Generate clusters (token overlap grouping)
    const clusters = this.generateClusters(observations);

    return {
      observation_links,
      clusters,
      raw_facts,
    };
  }

  private generateLinks(
    observations: Observation[]
  ): Array<{
    type: "same_entity" | "temporal_order" | "explicit_contradiction";
    source_ids: string[];
    reason: string;
  }> {
    const links: Array<{
      type: "same_entity" | "temporal_order" | "explicit_contradiction";
      source_ids: string[];
      reason: string;
    }> = [];
    const seen = new Set<string>();

    for (let i = 0; i < observations.length; i++) {
      for (let j = i + 1; j < observations.length; j++) {
        const obs1 = observations[i];
        const obs2 = observations[j];

        const linkKey = `${obs1.observation_id}|${obs2.observation_id}`;
        if (seen.has(linkKey)) continue;

        // Check same entity (simple string match)
        if (
          obs1.evidence_text.toLowerCase() ===
          obs2.evidence_text.toLowerCase()
        ) {
          links.push({
            type: "same_entity",
            source_ids: [obs1.observation_id, obs2.observation_id],
            reason: "identical evidence text",
          });
          seen.add(linkKey);
          continue;
        }

        // Check sentence proximity (same sentence cluster)
        if (this.inSameSentence(obs1.evidence_text, obs2.evidence_text)) {
          links.push({
            type: "same_entity",
            source_ids: [obs1.observation_id, obs2.observation_id],
            reason: "appear in same sentence",
          });
          seen.add(linkKey);
        }
      }
    }

    return links;
  }

  private generateClusters(
    observations: Observation[]
  ): Array<{
    cluster_id: string;
    observation_ids: string[];
    rule: string;
  }> {
    const clusters: Array<{
      cluster_id: string;
      observation_ids: string[];
      rule: string;
    }> = [];
    const assigned = new Set<string>();
    let clusterIndex = 0;

    for (let i = 0; i < observations.length; i++) {
      if (assigned.has(observations[i].observation_id)) continue;

      const cluster: string[] = [observations[i].observation_id];
      assigned.add(observations[i].observation_id);

      // Find observations with token overlap > 2
      for (let j = i + 1; j < observations.length; j++) {
        if (assigned.has(observations[j].observation_id)) continue;

        if (this.tokenOverlapCount(
          observations[i].evidence_text,
          observations[j].evidence_text
        ) > 2) {
          cluster.push(observations[j].observation_id);
          assigned.add(observations[j].observation_id);
        }
      }

      // Only create cluster if has multiple members
      if (cluster.length > 1) {
        clusters.push({
          cluster_id: `CL-${String(clusterIndex).padStart(4, "0")}`,
          observation_ids: cluster,
          rule: "shared_entity_reference_only",
        });
        clusterIndex++;
      }
    }

    return clusters;
  }

  private inSameSentence(text1: string, text2: string): boolean {
    const sentences = text1.split(/[.!?]+/);
    return sentences.some((sentence) =>
      sentence.toLowerCase().includes(text2.toLowerCase())
    );
  }

  private tokenOverlapCount(text1: string, text2: string): number {
    const tokens1 = new Set(
      text1.toLowerCase().split(/\s+/).filter((t) => t.length > 3)
    );
    const tokens2 = text2.toLowerCase().split(/\s+/).filter((t) => t.length > 3);

    let overlap = 0;
    for (const token of tokens2) {
      if (tokens1.has(token)) overlap++;
    }
    return overlap;
  }
}
