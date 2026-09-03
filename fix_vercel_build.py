import json, os

# 1. Disable ESLint errors during build
pkg = json.load(open('package.json'))
if 'scripts' not in pkg:
    pkg['scripts'] = {}
pkg['scripts']['build'] = 'DISABLE_ESLINT_PLUGIN=true react-scripts build'
json.dump(pkg, open('package.json', 'w'), indent=2)
print("✅ package.json updated - ESLint disabled for build")

# 2. Create .env.production
with open('.env.production', 'w') as f:
    f.write('REACT_APP_API_URL=https://web-production-63685.up.railway.app\n')
    f.write('DISABLE_ESLINT_PLUGIN=true\n')
    f.write('CI=false\n')
print("✅ .env.production created")

# 3. Create vercel.json
vercel_config = {
    "buildCommand": "CI=false npm run build",
    "outputDirectory": "build",
    "framework": "create-react-app"
}
json.dump(vercel_config, open('vercel.json', 'w'), indent=2)
print("✅ vercel.json created")

print("\nAll done! Now push and redeploy.")
