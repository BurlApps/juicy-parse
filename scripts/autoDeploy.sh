#!/usr/bin/env bash

bash scripts/distribute.sh $1
cd ../Production/
bash scripts/deploy.sh
cd ../Development/
