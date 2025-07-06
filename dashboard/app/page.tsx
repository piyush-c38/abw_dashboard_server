"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const router = useRouter();

  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center relative "
        style={{
          backgroundImage: "url('blue_wall_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}>
        <div className="absolute inset-0 bg-black/20 z-0" />
        <div className="w-3/4 h-3/4 bg-gray-50 z-10 rounded-2xl flex flex-col justify-center gap-24 ">
          <div className="absolute top-5 right-5 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-[#153c49] font-bold">Settings</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/jobdetail")}>
                    Job Details
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-center w-full ">
            <div className="w-auto flex flex-col md:flex-row justify-center items-center gap-10 p-3">
              <Image
                src="/logo_506.png"
                alt="Logo_506"
                width={200}
                height={200}
              />
              <div className="text-2xl md:text-4xl font-semibold text-[#153c49] text-shadow-[#153c49] text-center"> 506 Army Base Workshop</div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-10 justify-center">
              <Button className="w-50 h-15 text-xl bg-[#153c49] text-white hover:bg-[#0d2933]" onClick={() => router.push("/todayjob")}>Today's Job</Button>
              <Button className="w-50 h-15 text-xl bg-[#153c49] text-white hover:bg-[#0d2933]" onClick={() => router.push("/daysummary")}>Day Summary</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
