set -ex
# SET THE FOLLOWING VARIABLES
USERNAME=rin
IMAGE=facer
docker build -t $USERNAME/$IMAGE:latest .
