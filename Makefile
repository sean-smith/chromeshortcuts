# Pacakges up the App

clean:
	-rm alias.zip

zip:
	zip -r alias.zip . \
		--exclude \*.git\* \
		--exclude \*Makefile \
		--exclude \*README.md \
		--exclude \*store_assets\* \
		--exclude \*.DS_Store
