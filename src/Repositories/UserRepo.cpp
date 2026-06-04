#include "Repositories/UserRepo.h"

std::optional<std::vector<User>> UserRepo::GetUsers()
{
	return this->query<User>(R"(
		SELECT
			id, name, email, password
		FROM
			users
	)");
}

std::optional<User> UserRepo::GetUser(int id, const std::string& name, const std::string& email)
{
	std::ostringstream queryOss;

	queryOss << R"(
		SELECT
			id, name, email, password
		FROM
			users
		WHERE TRUE
			
	)";

	int paramsIndex = 1;
	pqxx::params params;

	if(id >= 0)
	{
		queryOss << "AND id = $" << paramsIndex++ << std::endl;
		params.append(id);
	}

	if(name.empty())
	{
		queryOss << "AND name = " << paramsIndex++ << std::endl;
		params.append(name);
	}

	if(email.empty())
	{
		queryOss << "AND email = " << paramsIndex++ << std::endl;
		params.append(email);
	}

	std::string query = queryOss.str();

	auto result = this->query<User>(query, params);

	if(result.has_value())
	{
		return result->empty() ? User() : result->front();
	}
	
	return std::nullopt;
}

std::optional<int> UserRepo::InsertUser(const User& user)
{
	auto result = this->query<int>(R"(
		INSERT INTO users(name, email, password) VALUES
			($1, $2, $3)
		RETURNING id
	)", user.name, user.email, user.password);

	if(result.has_value())
	{
		return result->empty() ? int() : result->front();
	}

	return std::nullopt;
}

bool UserRepo::DeleteUser(int id)
{
	auto result = this->query<int>(R"(
		DELETE FROM users
		WHERE TRUE
			AND id = $1
		RETURNING id
	)", id);

	return result.has_value() && !result->empty();
}

bool UserRepo::UpdateUser(const User& user)
{
	std::ostringstream queryOss;

	queryOss << R"(
		UPDATE users

	)";

	int paramsIndex = 1;
	pqxx::params params;	

	if(!user.name.empty())
	{
		queryOss << "SET name = $" << paramsIndex++ << std::endl;
		params.append(user.name);
	}

	if(!user.email.empty())
	{
		queryOss << "SET email = $" << paramsIndex++ << std::endl;
		params.append(user.email);
	}

	queryOss << "WHERE id = $" << paramsIndex++ << std::endl;
	params.append(user.id);

	queryOss << "RETURNING id" << std::endl;

	std::string query = queryOss.str();

	auto result = this->query<int>(query, params);

	return result.has_value() && !result->empty();	
}
