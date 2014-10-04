git add .
git commit -m "$1"

git pull

git checkout .
git checkout master
git merge origin/development

git checkout development
git push
