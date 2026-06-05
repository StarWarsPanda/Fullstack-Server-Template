#include "Services/UserService.h"
#include <chrono>

nlohmann::json UserService::RegisterUser(User& user) const
{
	auto userCollision = m_repository.GetUser(user.id, user.name, user.email);

	if(userCollision.has_value())
	{
		return nlohmann::json{
			{ "error", "User already exists" }
		};
	}

	/*
	user.password = hash(user.password);
	*/

	auto result = m_repository.InsertUser(user);

	if(result.has_value())
	{
		return nlohmann::json{{ "id", result.value() }};
	}

	return nlohmann::json{
		{"error", "Internal server error" }
	};
}

nlohmann::json UserService::LoginUser(const std::string& username, const std::string& password)
{
	auto user = m_repository.GetUser(-1, username);

	if (!user.has_value())
	{
		return nlohmann::json{
			{"error", "User not found" }
		};
	}

	if(m_attemptWait.find(user->id) != m_attemptWait.end() && std::chrono::steady_clock::now() < m_attemptWait[user->id])
	{
		return nlohmann::json{
			{"error", "Too many attempts. Come back later" }
		};
	}

	if(user->password == password)
	{
		return user.value();
	}
	else
	{
		m_attemptCount[user->id] += 1;

		if(m_attemptCount[user->id] >= 5)
		{
			m_attemptWait[user->id] = std::chrono::steady_clock::now() + std::chrono::minutes(5);
		}
	}

	return nlohmann::json::object();
}

bool UserService::RemoveUser(int id) const
{
	return false;
}

bool UserService::UpdateUser(const User& user) const
{
	return false;
}

bool UserService::ChangeUserPassword(const User& user, const std::string& newPassword) const
{
	return false;
}
