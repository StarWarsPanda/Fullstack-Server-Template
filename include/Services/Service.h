#pragma once

#include "Repositories/Repository.h"

template <typename ModelT>
class Service
{
	public:
		explicit Service(Repository<ModelT>& repository) : m_repository(repository) {}
		virtual ~Service() = default;
	protected:
		Repository<ModelT>& m_repository;
};
