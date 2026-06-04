#pragma once

#include "json.hpp"
#include <string>
#include <boost/pfr.hpp>

struct User
{
	int id;
	std::string name;
	std::string email;
	std::string password;
};

inline void to_json(nlohmann::json& json, const User& user)
{
	json = nlohmann::json{
		{"id", user.id },
		{"name", user.name },
		{"email", user.email },
		{"password", user.password }
	};
}

inline void from_json(const nlohmann::json& json, User& user)
{
	user.id = json.value("id", -1);
	user.name = json.value("name", "");
	user.email = json.value("email", "");
	user.password = json.value("password", "");
}
