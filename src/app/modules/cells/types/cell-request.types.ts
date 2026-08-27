import { MeetingDay } from '@modules/cells/enums/cell.enums';
import { Gender } from '@core/types/gender.types';
import { PaginationCriteria } from '@core/types/pagination.types';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';

export interface CellRegisterRequest {
  name: string;
  leaderDiscipleId: number | null;
  meetingDay: MeetingDay | null;
  meetingTime: string | null;
  location: string | null;
  isPastorCell: boolean;
  pastorCellGender: Gender | null;
}

export interface CellUpdateRequest {
  name: string;
  leaderDiscipleId: number | null;
  meetingDay: MeetingDay | null;
  meetingTime: string | null;
  location: string | null;
}

export interface CellAddMemberRequest {
  discipleId: number;
}

export interface CellMoveMemberRequest {
  targetCellId: number;
}

export interface CellSearchCriteria extends PaginationCriteria {
  name?: string;
  leaderName?: string;
  meetingDay?: MeetingDay;
  isPastorCell?: boolean;
}

export interface CellMemberSearchCriteria {
  search?: string;
  spiritualLevel?: SpiritualLevel;
  gender?: Gender;
}