#pragma once

#include "boost/pfr/core.hpp"
#include "boost/pfr/tuple_size.hpp"
#include <cstddef>
#include <iostream>
#include <optional>
#include <type_traits>
#include <utility>
#include <vector>
#include <string>
#include <pqxx/pqxx>
#include <boost/pfr.hpp>

template <typename ModelT>
class Repository
{
	public:
		explicit Repository(pqxx::connection& connection) : m_connection(connection) {}
		virtual ~Repository() = default;
	protected:
		template<typename T, typename... Args>
		std::optional<std::vector<T>> query(const std::string& sql, Args&&... args)
		{
			try
			{
				pqxx::work transactionBase(m_connection);
				auto rows = transactionBase.exec(sql, pqxx::params{ std::forward<Args>(args)... });
				transactionBase.commit();

				std::vector<T> result;
	
				result.reserve(rows.size());
	
				for(const auto& row : rows)
				{
					T obj{};
				
					[&]<std::size_t... I>(std::index_sequence<I...>)
					{
						(
							(
								boost::pfr::get<I>(obj) = row[I].template as<std::remove_reference_t<decltype(boost::pfr::get<I>(obj))>>()
							),
							...
						);
					}(std::make_index_sequence<boost::pfr::tuple_size_v<T>>{});
	
					result.push_back(std::move(obj));
				}

				return result;
			}
			catch (const pqxx::sql_error &e)
			{
				std::cerr << "PSQL error: " << e.what() << std::endl;
				std::cerr << "Query: " << e.query() << std::endl;
			}
			catch (const std::exception& e)
			{
				std::cerr << "Standard error: " << e.what() << std::endl;
			}

			return std::nullopt;
		}
	protected:
		pqxx::connection& m_connection;
};
