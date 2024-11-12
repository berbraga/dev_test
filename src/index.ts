import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Post } from './entity/Post';

const app = express();
app.use(express.json());

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "bernardo",
  database: process.env.DB_NAME || "test_db",
  entities: [User, Post],
  synchronize: true,
});

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initializeDatabase = async () => {
  await wait(20000);
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    process.exit(1);
  }
};

initializeDatabase();

app.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    const newUser = userRepository.create({ firstName, lastName, email });
    const savedUser = await userRepository.save(newUser);

    res.status(201).json(savedUser);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') { 
      // 'ER_DUP_ENTRY' é o código de erro do MySQL para duplicatas, e '23505' é o do PostgreSQL
      res.status(400).json({ message: "O email já está em uso. Escolha outro email." });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    const postRepository = AppDataSource.getRepository(Post);
    const userRepository = AppDataSource.getRepository(User);

    // Verifica se o usuário existe
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado com o ID fornecido." });
    }

    // Se o usuário for encontrado, cria o novo post
    const newPost = postRepository.create({ title, description, user });
    const savedPost = await postRepository.save(newPost);

    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Erro ao criar post:", error);
    res.status(500).json({ message: "Erro ao criar post." });
  }
});


// ========================================================

// Endpoint para listar todos os usuários com seus posts
app.get('/users', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    console.log("Buscando usuários...");
    const users = await userRepository.find({ relations: ["posts"] }); 
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
});

// Endpoint para listar todos os posts de um usuário específico
app.get('/users/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params;
    const postRepository = AppDataSource.getRepository(Post);
    const userRepository = AppDataSource.getRepository(User);

    // Verifica se o usuário existe
    const user = await userRepository.findOneBy({ id: parseInt(userId) });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado com o ID fornecido." });
    }

    // Busca todos os posts do usuário
    const posts = await postRepository.find({
      where: { user: { id: parseInt(userId) } },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Erro ao buscar posts do usuário:", error);
    res.status(500).json({ message: "Erro ao buscar posts do usuário." });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
