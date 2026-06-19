/**
 * Observation Engine - Repository (Wave 1.2)
 *
 * Handles persistence of individual observation records
 * Each observation is immutable and traceable
 * observation_id is UUID v4 for global uniqueness and safety under distributed execution
 */

import { Observation } from './schema';

export interface ObservationRepository {
  save(observation: Observation): Promise<void>;
  saveBatch(observations: Observation[]): Promise<void>;
  get(observation_id: string): Promise<Observation | null>;
  getByCandidateId(candidate_id: string): Promise<Observation[]>;
  getMany(candidate_ids: string[]): Promise<Observation[]>;
}

/**
 * PostgreSQL implementation
 */
export class PostgresObservationRepository implements ObservationRepository {
  constructor(private sql: any) {}

  async save(observation: Observation): Promise<void> {
    await this.sql`
      INSERT INTO observations (
        observation_id,
        candidate_id,
        observation_type,
        evidence_text,
        source,
        confidence,
        source_url,
        source_date,
        source_author,
        extracted_at,
        cached_until
      ) VALUES (
        ${observation.observation_id},
        ${observation.candidate_id},
        ${observation.observation_type},
        ${observation.evidence_text},
        ${observation.source},
        ${observation.confidence},
        ${observation.source_url || null},
        ${observation.source_date || null},
        ${observation.source_author || null},
        ${observation.extracted_at},
        ${observation.cached_until}
      )
      ON CONFLICT (observation_id) DO UPDATE SET
        evidence_text = ${observation.evidence_text},
        cached_until = ${observation.cached_until}
    `;
  }

  async saveBatch(observations: Observation[]): Promise<void> {
    if (observations.length === 0) return;

    const values = observations.map(obs => `(
      ${this.sql.escapeLiteral(obs.observation_id)},
      ${this.sql.escapeLiteral(obs.candidate_id)},
      ${this.sql.escapeLiteral(obs.observation_type)},
      ${this.sql.escapeLiteral(obs.evidence_text)},
      ${this.sql.escapeLiteral(obs.source)},
      ${this.sql.escapeLiteral(obs.confidence)},
      ${this.sql.escapeLiteral(obs.source_url || null)},
      ${this.sql.escapeLiteral(obs.source_date || null)},
      ${this.sql.escapeLiteral(obs.source_author || null)},
      ${this.sql.escapeLiteral(obs.extracted_at)},
      ${this.sql.escapeLiteral(obs.cached_until)}
    )`);

    await this.sql.unsafe(`
      INSERT INTO observations (
        observation_id,
        candidate_id,
        observation_type,
        evidence_text,
        source,
        confidence,
        source_url,
        source_date,
        source_author,
        extracted_at,
        cached_until
      ) VALUES ${values.join(',')}
      ON CONFLICT (observation_id) DO UPDATE SET
        evidence_text = EXCLUDED.evidence_text,
        cached_until = EXCLUDED.cached_until
    `);
  }

  async get(observation_id: string): Promise<Observation | null> {
    const rows = await this.sql`
      SELECT * FROM observations WHERE observation_id = ${observation_id}
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    return this.rowToObservation(rows[0]);
  }

  async getByCandidateId(candidate_id: string): Promise<Observation[]> {
    const rows = await this.sql`
      SELECT * FROM observations
      WHERE candidate_id = ${candidate_id}
      ORDER BY extracted_at DESC
    `;

    return rows.map((row: any) => this.rowToObservation(row));
  }

  async getMany(candidate_ids: string[]): Promise<Observation[]> {
    if (candidate_ids.length === 0) {
      return [];
    }

    const rows = await this.sql`
      SELECT * FROM observations
      WHERE candidate_id = ANY(${candidate_ids}::uuid[])
      ORDER BY candidate_id, extracted_at DESC
    `;

    return rows.map((row: any) => this.rowToObservation(row));
  }

  private rowToObservation(row: any): Observation {
    return {
      observation_id: row.observation_id,
      candidate_id: row.candidate_id,
      observation_type: row.observation_type as any,
      evidence_text: row.evidence_text,
      source: row.source,
      confidence: row.confidence,
      source_url: row.source_url,
      source_date: row.source_date,
      source_author: row.source_author,
      extracted_at: row.extracted_at,
      cached_until: row.cached_until,
    };
  }
}
