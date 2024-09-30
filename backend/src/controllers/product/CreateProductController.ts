import { Request, Response } from "express";
import { CreateProductService } from "../../services/product/CreateProductService";

class CreateProductController {
    async handle(req: Request, res: Response) {
      const { nome, categoriaId, tamanhos, valores } = req.body;
  
      const createProductService = new CreateProductService();
  
      const produto = await createProductService.execute({
        nome,
        categoriaId,
        tamanhos,
        valores
      });
  
      return res.json(produto);
    }
  }
  
  export { CreateProductController };