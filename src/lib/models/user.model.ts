import { Role } from '../../routes/(auth)/-models/role.model';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}
