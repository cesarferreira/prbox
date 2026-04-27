.PHONY: build install uninstall clean dev test

build:
	bun run build.ts

install: build
	cp ./prbox /usr/local/bin/prbox
	@echo "Installed prbox to /usr/local/bin/prbox"

uninstall:
	rm -f /usr/local/bin/prbox
	@echo "Removed /usr/local/bin/prbox"

clean:
	rm -f ./prbox

dev:
	bun run src/main.ts

test:
	bun test
