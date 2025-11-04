import { Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountsService {
  // TODO: Implement discount creation with validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(_createDiscountDto: CreateDiscountDto) {
    return 'This action adds a new discount';
  }

  // TODO: Implement discount listing with active/inactive filter
  findAll() {
    return `This action returns all discounts`;
  }

  // TODO: Implement discount retrieval
  findOne(id: number) {
    return `This action returns a #${id} discount`;
  }

  // TODO: Implement discount update with validation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateDiscountDto: UpdateDiscountDto) {
    return `This action updates a #${id} discount`;
  }

  // TODO: Implement discount deactivation
  remove(id: number) {
    return `This action removes a #${id} discount`;
  }
}
