export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'facility_admin' | 'doctor' | 'nurse' | 'user';
}

export interface CreateUserResponse {
  uid: string;
}

export interface UserDocument {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: FirebaseFirestore.Timestamp;
}
