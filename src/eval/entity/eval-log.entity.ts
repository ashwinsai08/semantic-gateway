import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('eval_logs')
export class EvalLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  query: string;

  @Column('text')
  answer: string;

  @Column({ type: 'text', nullable: true })
  context: string | null;

  @Column({ type: 'varchar', length: 10 })
  source: string;

  @Column({ type: 'float', nullable: true })
  faithfulness: number | null;

  @Column({ type: 'float' })
  relevance: number;

  @Column({ name: 'rerank_score', type: 'float', nullable: true })  // ← explicit name
  rerankScore: number | null;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ name: 'hallucination_risk', type: 'varchar', length: 10 })  // ← explicit name
  hallucinationRisk: string;

  @Column({ name: 'latency_ms', type: 'int', nullable: true })  // ← explicit name
  latencyMs: number | null;

  @CreateDateColumn({ name: 'created_at' })  // ← explicit name
  createdAt: Date;
}