import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Apenas um cliente pode fazer uma ordem');
    }
    const productsExists = await this.productsRepository.findAllById(
      products.map(({ id }) => ({ id })),
    );

    if (productsExists.length !== products.length) {
      throw new AppError('There are an inexistent product in list');
    }

    products.forEach(({ id, quantity }) => {
      const indexProduct = productsExists.findIndex(
        product => product.id === id,
      );
      if (quantity > productsExists[indexProduct].quantity) {
        throw new AppError(
          `Quantity of ${productsExists[indexProduct].name} product is above to the stock limit`,
        );
      }
    });

    await this.productsRepository.updateQuantity(products);

    const orderProducts = productsExists.map(product => ({
      product_id: product.id,
      price: product.price,
      quantity:
        products[products.findIndex(data => data.id === product.id)].quantity,
    }));

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    return order;
  }
}

export default CreateOrderService;
