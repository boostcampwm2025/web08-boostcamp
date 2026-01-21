import { z } from "zod";

// Zod 스키마: 1-6자, 모든 유니코드 허용
export const passwordSchema = z
  .string()
  .min(1, "비밀번호를 입력해주세요")
  .max(16, "닉네임은 최대 16자까지 입력 가능합니다.");

export type Password = z.infer<typeof passwordSchema>;
