#!/bin/bash
echo "--- GIT LOG ---" > git_report.txt
git log -n 5 --oneline >> git_report.txt
echo "--- STATUS ---" >> git_report.txt
git status >> git_report.txt
echo "--- PUSHING ---" >> git_report.txt
git add .
git commit -m "chore: version bump 1.2.7 and force sync"
git push origin main >> git_report.txt 2>&1
echo "--- DONE ---" >> git_report.txt
