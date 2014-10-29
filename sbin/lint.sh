#!/bin/bash

# Set strict options
set -o errexit
set -o nounset


# Get project directory
PROJECTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)";

# Extract command from arguments
COMMAND=${1:-};

# jshint command with arguments
JSHINT="${PROJECTDIR}/node_modules/.bin/jshint --config ${PROJECTDIR}/.jshintrc"


# Function which updates git hooks
updateGitHooks() {
	echo "Updating git hooks";

	# Update hook contents
	cat >${PROJECTDIR}/.git/hooks/pre-commit <<EOF
#!/bin/bash
PROJECTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)";
make -C "${PROJECTDIR}" test lintFilter=staged
EOF

	# Update hook permissions
	chmod +x ${PROJECTDIR}/.git/hooks/pre-commit
}


# Function which prints error and usage help
function printHelp() {
	echo "";

	if [ -n "${1:-}" ]; then
		echo "  ${1:-}";
		echo "";
	fi

	echo "  Usage: $0 <command> [options]";
	echo "";
	echo "  Commands:";
	echo "";
	echo "    setup       Setup jshint githooks";
	echo "    staged      Lint all staged files";
	echo "    all         Lint all files in the project. This is the default command.";
	echo "";

}


# Process command
case ${COMMAND} in
	"setup" )
		updateGitHooks;
	;;
	"staged" )
		git diff --raw --name-only --cached --diff-filter=ACMR | grep -E '\.js(on)?$' | xargs -I '{}' ${JSHINT} '{}';
	;;
	"all" )
		eval "${JSHINT} ${PROJECTDIR}";
	;;
	"" )
		eval "${JSHINT} ${PROJECTDIR}";
	;;
	"help" )
		printHelp;
	;;
	* )
		printHelp "Invalid command: ${COMMAND}";
	;;
esac