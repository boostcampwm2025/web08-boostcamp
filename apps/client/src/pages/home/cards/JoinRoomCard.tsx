import { Hash } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function JoinRoomCard() {
  return (
    <Card className="cursor-pointer bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-500 hover:shadow-sm transition-all duration-150 shadow-none">
      <CardHeader className="pb-4">
        <div className="bg-purple-100 border border-purple-200 w-12 h-12 mb-2 rounded-sm flex items-center justify-center">
          <Hash className="h-6 w-6 text-purple-500" />
        </div>
        <CardTitle className="text-xl text-gray-800">방 번호로 입장</CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          기존 방 번호를 입력하여 협업에 참여하세요
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
