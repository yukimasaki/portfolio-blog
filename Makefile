# Frontend
yarn:
	cd app && yarn
dev:
	cd app && yarn dev
build:
	cd app && yarn build
start:
	cd app && yarn start
test:
	cd app && yarn test
type:
	cd app && yarn type-check
lint:
	cd app && yarn lint
format:
	cd app && yarn format:fix
ui-add:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "使用方法: make ui-add <component-name>"; \
		echo "例: make ui-add button"; \
		exit 1; \
	fi
	cd app && npx shadcn@latest add $(filter-out $@,$(MAKECMDGOALS))