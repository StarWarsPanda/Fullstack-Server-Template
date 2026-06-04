#include "Models/User.h"
#include "Repository.h"
#include <optional>
#include <string>

class UserRepo : Repository<User>
{
	public:
		UserRepo(pqxx::connection& connection) : Repository<User>(connection) {}

		std::optional<std::vector<User>> GetUsers();
		std::optional<User> GetUser(int id = -1, const std::string& name = "", const std::string& email = "");
		std::optional<int> InsertUser(const User& user);
		bool DeleteUser(int id);
		bool UpdateUser(const User& user);
};
