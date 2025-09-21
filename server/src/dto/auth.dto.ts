export class AuthenticatedUserDto {
  id!: string;
  email!: string | null;
  name!: string | null;
  handle!: string | null;
  country!: string | null;
  tz!: string;
  role!: string;
  status!: string;
  createdAt!: Date;
}
