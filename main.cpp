#include <exception>
#include <iostream>
#include <ostream>

#include <httplib.h>
#include <json.hpp>
#include <pqxx/pqxx>

#include "include/Services/UserService.h"

int main()
{
	pqxx::connection conn("host=host.docker.internal port=5432 dbname=main user=mainuser password=password123");

	UserRepo userRepo(conn);
	UserService userService(userRepo);

	httplib::Server server;

	server.set_post_routing_handler([](const httplib::Request& request, httplib::Response& response) {
			response.set_header("Access-Control-Allow-Origin", "*");
	});

	server.Options(R"(.*)", [](const httplib::Request& request, httplib::Response& response) {
			response.set_header("Access-Control-Allow-Origin", "*");
			response.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			response.set_header("Access-Control-Allow-Headers", "*");

			response.status = 204;
	});

	server.Post("/login", [&userService](const httplib::Request& request, httplib::Response& response) {
			nlohmann::json body = nlohmann::json::parse(request.body);			
			nlohmann::json login = userService.LoginUser(body["username"], body["password"]);
			
			if(login.contains("error"))
			{
				response.status = 401;
				response.set_content(login.dump(), "application/json");
			}

			response.status = 200;
			response.set_content(nlohmann::json{
				{ "id", login["id"] },
				{ "name", login["name"] },
				{ "email", login["email"] }
			}.dump(), "application/json");
	});

	server.Post("/register", [userService](const httplib::Request& request, httplib::Response& response) {
			User user = nlohmann::json::parse(request.body);
			nlohmann::json registeredUser = userService.RegisterUser(user);

			if(registeredUser.contains("error"))
			{
				response.status = 400;	
			}

			response.status = 200;
			response.set_content(registeredUser.dump(), "application/json");
	});

	server.set_logger([](const httplib::Request& request, const httplib::Response& response){
			std::cout << "[INFO]: " << request.method << " " << request.path << " (" << request.get_header_value("Host") << ")" << std::endl;
	});

	std::cout << "Starting server at 127.0.0.1/0:8080" << std::endl;
	server.listen("127.0.0.1", 8080);	

	return 0;
}
