import { MeetingDay } from '@modules/cells/enums/cell.enums';
import { Gender } from '@core/types/gender.types';
import { SpiritualLevel } from '@modules/disciples/enums/disciple.enums';
import { BirthdayAlertResponse } from '@modules/disciples/types/disciple-response.types';

export interface CellLeaderResponse {
  id: number;
  firstName: string;
  lastName: string;
}

export interface CellResponse {
  id: number;
  name: string;
  leader: CellLeaderResponse | null;
  meetingDay: MeetingDay | null;
  meetingDaySpanishName: string | null;
  meetingTime: string | null;
  location: string | null;
  isPastorCell: boolean;
  pastorCellGender: Gender | null;
  memberCount: number;
}

export interface CellMemberResponse {
  memberId: number;
  discipleId: number;
  firstName: string;
  lastName: string;
  phoneCodeNumber: string | null;
  phoneNumber: string | null;
  spiritualLevel: SpiritualLevel;
  birthDate: string | null;
  age: number | null;
  gender: Gender;
  isCellGroupLeader: boolean;
  isCoreTwelve: boolean;
  isPastorCoreTwelve: boolean;
  birthdayAlert: BirthdayAlertResponse | null;
}