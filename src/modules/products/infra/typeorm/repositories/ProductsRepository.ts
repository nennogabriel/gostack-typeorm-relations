import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const productFound = await this.ormRepository.findOne({
      where: {
        name,
      },
    });
    return productFound;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const productsIds = products.map(product => product.id);
    const productsFound = await this.ormRepository.find({
      where: { id: In(productsIds) },
    });
    return productsFound;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO
    const productsIds = products.map(product => product.id);
    const productsFound = await this.ormRepository.findByIds(productsIds);
    products.forEach(({ id, quantity }) => {
      const productIndex = productsFound.findIndex(
        product => product.id === id,
      );
      productsFound[productIndex].quantity -= quantity;
    });

    await this.ormRepository.save(productsFound);
    return productsFound;
  }
}

export default ProductsRepository;
