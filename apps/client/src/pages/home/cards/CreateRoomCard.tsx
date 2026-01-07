import { Users, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function CreateRoomCard() {
  return (
    <Card className="cursor-pointer bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-500 hover:shadow-sm transition-all duration-150 shadow-none">
      <CardHeader className="pb-4">
        <div className="bg-blue-100 border border-blue-200 w-12 h-12 mb-2 rounded-sm flex items-center justify-center">
          <Users className="h-6 w-6 text-blue-500" />
        </div>
        <CardTitle className="text-xl text-gray-800">방 만들기</CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          새로운 협업 공간을 생성하고 팀원들을 초대하세요
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
