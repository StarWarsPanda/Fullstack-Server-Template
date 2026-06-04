#include <exception>
#include <iostream>
#include <ostream>

#include <httplib.h>
#include <json.hpp>
#include <pqxx/pqxx>

#include "include/Models/User.h"
#include "include/Repositories/UserRepo.h"

int main()
{
	User user;

	try {
		pqxx::connection conn("host=18.214.100.158 port=5432 dbname=main user=mainuser password=password123");

		if(conn.is_open())
		{
			std::cout << "Connected to " << conn.dbname() << "!" << std::endl;

			UserRepo ur = UserRepo(conn);

			auto result = ur.GetUsers();

			std::vector<User> users;
			if(result.has_value())
			{
				users = result.value();
			}

			for(const auto& user : users)
			{
				std::cout << "--- User ---" << std::endl;
				std::cout << "id: " << user.id << std::endl;
				std::cout << "name: " << user.name << std::endl;
				std::cout << "email: " << user.email << std::endl;
				std::cout << "password: " << user.password << std::endl;
				std::cout << "------------" << std::endl;
			}
		}
		else
		{
			std::cerr << "Connection dropped" << std::endl;
		}
	} catch (const std::exception& e) {
		std::cerr << "Error: " << e.what() << std::endl;
		return 1;
	}

	httplib::Server server;

	server.Get("(.*)", [](const httplib::Request& request, httplib::Response& response) {
			nlohmann::json jResponse;

			jResponse["method"] = request.method;
			jResponse["path"] = request.path;
			jResponse["body"] = request.body;

			jResponse["headers"] = nlohmann::json::object();

			for(const auto& [header, value] : request.headers)
			{
				jResponse["headers"][header] = value;
			}

			jResponse["params"] = nlohmann::json::object();

			for(const auto& [param, value] : request.params)
			{
				jResponse["params"][param] = value;
			}

			response.status = 200;
			response.set_content(jResponse.dump(4), "application/json");
	});

	server.set_logger([](const httplib::Request& request, const httplib::Response& response){
			std::cout << "[INFO]: " << request.method << " " << request.path << " (" << request.get_header_value("Host") << ")" << std::endl;
	});

	std::cout << "Starting server at 0.0.0.0/0:8080" << std::endl;
	server.listen("0.0.0.0", 8080);	

	return 0;
}
