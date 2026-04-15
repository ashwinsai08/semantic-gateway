import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({
    type: 'vector',
    length: 768,
  })
  embedding: number[];
}