/**
 * Re-exporta todas as interfaces de Board do core.
 * Mantém compatibilidade com imports existentes no módulo Board.
 */
export {
  Board,
  List,
  Card,
  Comment,
  CreateListDto,
  CreateCardDto,
  UpdateListDto,
  UpdateCardDto
} from '../../../core/interfaces';
