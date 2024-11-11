import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Post } from "./Post";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // Adicionando o operador "!" para sinalizar inicialização pelo TypeORM

  @Column({ type: "varchar", length: 100, nullable: false })
  firstName!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  lastName!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  email!: string;

  @OneToMany(() => Post, (post) => post.user)
  posts!: Post[];
}
