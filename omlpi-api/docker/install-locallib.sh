#!/bin/bash

export USER=app

# Create directories to mimic Perlbrew structure
mkdir -p /home/app/perl5/perlbrew/etc

# Install local::lib
cpanm --local-lib=~/perl5 local::lib && eval $(perl -I ~/perl5/lib/perl5/ -Mlocal::lib)

# Create a custom bashrc for compatibility
cat << EOF > /home/app/perl5/perlbrew/etc/bashrc
# This file mimics Perlbrew's bashrc for compatibility
# It actually sets up local::lib

export PERLBREW_ROOT="/home/app/perl5/perlbrew"
export PERLBREW_HOME="/home/app/.perlbrew"
export PERLBREW_PATH="/home/app/perl5/perlbrew/bin"
export PATH="/home/app/perl5/perlbrew/bin:$PATH"

eval "\$(perl -I\$HOME/perl5/lib/perl5 -Mlocal::lib)"
EOF

# Add sourcing of the custom bashrc to .bashrc
echo 'source /home/app/perl5/perlbrew/etc/bashrc' >> /home/app/.bashrc

# Source the new configuration
source /home/app/.bashrc

# Install any required Perl modules using cpanm
# For example:
# cpanm Some::Module Another::Module

# You can add more Perl module installations or other setup steps here