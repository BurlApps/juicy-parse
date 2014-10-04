#!/usr/bin/env bash

git add .
git commit -m "$1"
git push origin development

git pull

git checkout .
git checkout master
git merge origin/development
git push origin master

git checkout development
