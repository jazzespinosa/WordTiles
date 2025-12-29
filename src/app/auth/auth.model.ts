export interface SignUpRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponseDto {
  name: string;
  email: string;
}

export interface LoginResponseDto {
  email: string;
  name: string;
}

export interface UserModel {
  email: string;
  name: string;
}
