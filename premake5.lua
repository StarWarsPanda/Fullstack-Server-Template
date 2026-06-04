workspace "fullstacktemplate"
	configurations { "Debug", "Release" }
	architecture "x86_64"

project "fullstackserver"
	kind "ConsoleApp"
	language "C++"
	cppdialect "C++20"

	targetdir "bin/%{cfg.buildcfg}"
	objdir "obj/%{cfg.buildcfg}"

	files {
		"main.cpp",		
		"src/**.cpp"
	}

	includedirs {
		"include",
		"vendor/libpqxx/include",
		"vendor/httplib/include",
		"vendor/nlohmann/json/include",
		"vendor/boost"
	}

	libdirs {
		"vendor/libpqxx/lib",
		"/usr/lib64"
	}

	links {
		"pqxx",
		"pq",
		"ssl",
		"crypto"	
	}	

	filter "configurations:Debug"
		symbols "On"

	filter "configurations:Release"
		optimize "On"
