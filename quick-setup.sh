#!/bin/bash
# Quick GitHub Repository Setup
# Run this after creating the repository manually on GitHub

echo "========================================="
echo "GitHub Repository Setup - Quick Method"
echo "========================================="
echo ""
echo "Step 1: Create the repository on GitHub"
echo "  - Go to: https://github.com/new"
echo "  - Repository name: agentic-light-sentinel"
echo "  - Make it PRIVATE"
echo "  - Do NOT initialize with README, .gitignore, or license"
echo "  - Click 'Create repository'"
echo ""
echo "Step 2: Run these commands to push your code:"
echo ""
echo "git push -u origin master"
echo ""
echo "========================================="
echo ""
read -p "Press Enter after creating the repository on GitHub..."

# Push to GitHub
echo ""
echo "Pushing code to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "SUCCESS! ✓"
    echo "========================================="
    echo ""
    echo "Your repository is now live at:"
    echo "https://github.com/contact-shreyas/agentic-light-sentinel"
    echo ""
else
    echo ""
    echo "Push failed. You may need to enter your GitHub credentials."
    echo ""
fi
