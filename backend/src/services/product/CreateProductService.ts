import prismaClient from "../../prisma";

interface TamanhoRequest {
    tamanho: string;
}

interface ValorRequest {
    preco: number;
    tamanho: boolean;
    status: boolean;
}

interface ProdutoRequest {
    nome: string;
    categoriaId: number;
    tamanhos?: TamanhoRequest[];
    valores?: ValorRequest[];
}

class CreateProductService {
    private async produtoJaExiste(nome: string, categoriaId: number) {
        const produto = await prismaClient.produto.findFirst({
            where: { nome, categoriaId },
        });
        return !!produto;
    }

    private async criarTamanhos(produtoId: number, tamanhos: TamanhoRequest[]) {
        return await prismaClient.tamanho.createMany({
            data: tamanhos.map((t) => ({
                produtoId,
                tamanho: t.tamanho,
            })),
        });
    }

    private async criarValores(produtoId: number, valores: ValorRequest[]) {
        return await prismaClient.valor.createMany({
            data: valores.map((v) => ({
                produtoId,
                preco: v.preco,
                tamanho: v.tamanho,
                status: v.status,
            })),
        });
    }

    public async execute({ nome, categoriaId, tamanhos, valores }: ProdutoRequest) {
        if (!nome || !categoriaId) {
            throw new Error("Nome do produto e categoria são obrigatórios.");
        }

        // Verifica se categoriaId é um número
        if (typeof categoriaId !== 'number') {
            throw new Error("CategoriaId deve ser um número.");
        }

        const produtoExiste = await this.produtoJaExiste(nome, categoriaId);
        if (produtoExiste) {
            throw new Error("Esse produto já existe na categoria selecionada.");
        }

        const produto = await prismaClient.produto.create({
            data: { nome, categoriaId },
            select: { id: true, nome: true, categoriaId: true, dataCreate: true, dataUpdate: true },
        });

        if (tamanhos && tamanhos.length > 0) {
            await this.criarTamanhos(produto.id, tamanhos);
        }

        if (valores && valores.length > 0) {
            await this.criarValores(produto.id, valores);
        }

        const produtoCompleto = await prismaClient.produto.findUnique({
            where: { id: produto.id },
            include: {
                tamanhos: true,
                valores: true,
            },
        });

        return produtoCompleto;
    }
}

export { CreateProductService };