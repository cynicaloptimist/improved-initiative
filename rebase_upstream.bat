git fetch upstream
git checkout master
git stash
git rebase upstream/master
git stash pop