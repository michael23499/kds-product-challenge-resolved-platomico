import { IsEnum } from 'class-validator';
import { OrderState } from '../../../common/enums';

export class UpdateOrderStateDto {
  @IsEnum(OrderState)
  state: OrderState;
}
