# Pacakges up the App

clean:
	-rm alias.zip

zip:
	zip -r alias.zip . \
		--exclude \*.git\* \
		--exclude \*Makefile \
		--exclude \*omnibox_640x400.png \
		--exclude \*README.md