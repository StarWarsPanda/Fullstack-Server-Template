#pragma once

#include "Models/User.h"
#include "json.hpp"
#include "Repositories/UserRepo.h"
#include <chrono>
#include <cstdint>

class UserService
{
	public:
		explicit UserService(UserRepo& repository) : m_repository(repository) {}


		nlohmann::json RegisterUser(User& user) const;
		nlohmann::json LoginUser(const std::string& username, const std::string& password);
		bool RemoveUser(int id) const;

		/* Only for updating user fields (not id, password) */
		bool UpdateUser(const User& user) const;
		
		bool ChangeUserPassword(const User& user, const std::string& newPassword) const;
	private:
		std::map<int, uint8_t> m_attemptCount;
		std::map<int, std::chrono::steady_clock::time_point> m_attemptWait;
		UserRepo& m_repository;
};
