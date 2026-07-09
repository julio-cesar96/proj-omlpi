FROM phusion/baseimage:noble-1.0.0
CMD ["/sbin/my_init"]

# wkhtmltopdf
USER root
RUN apt-get update && apt-get install -y \
    imagemagick \
    shared-mime-info \
    xvfb \
    poppler-utils \
    xfonts-75dpi \
    libpng-dev \
    libdb-dev wkhtmltopdf \
&& rm -rf /var/lib/apt/lists/* && apt-get clean

# Perl
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libcurl4-openssl-dev libxml2 libxml2-dev libexpat1-dev zlib1g-dev libssl-dev \
    libjpeg-dev libgif-dev \
    git \
    cpanminus \
    && rm -rf /var/lib/apt/lists/* && apt-get clean

RUN useradd -ms /bin/bash app;

USER app
ADD install-locallib.sh /tmp/install-locallib.sh
RUN /tmp/install-locallib.sh

USER root
RUN apt-get update && apt-get install -y \
    libpq-dev \
    postgresql-client \
&& rm -rf /var/lib/apt/lists/* && apt-get clean

USER app

ADD install-cpan-modules.sh /tmp/install-cpan-modules.sh
RUN /tmp/install-cpan-modules.sh

USER app

ADD Makefile_local.PL /tmp/Makefile.PL
ADD install-cpan-extra-modules.sh /tmp/install-cpan-extra-modules.sh
RUN /tmp/install-cpan-extra-modules.sh

USER root
RUN echo "0 */3 * * * su - app -c 'cd /src; ./script/refresh_random_indicator_cache.sh'\n" | crontab -

RUN mkdir /etc/service/omlpi
COPY omlpi.sh /etc/service/omlpi/run

RUN mkdir /etc/service/omlpi-minion-worker
COPY omlpi-minion-worker.sh /etc/service/omlpi-minion-worker/run
