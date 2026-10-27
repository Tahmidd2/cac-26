"""Generalize the official NYC borough polygons for a small local map asset.
Download: https://data.cityofnewyork.us/resource/gthc-hcne.geojson
Input is fetched separately; this script makes no network requests.
"""
import json, sys

def simplify(points, epsilon=0.00008):
    if len(points) <= 4: return points
    def distance(p,a,b):
        dx,dy=b[0]-a[0],b[1]-a[1]
        t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
        return ((p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2)**0.5
    def walk(ps):
        if len(ps)<3:return ps
        ds=[distance(p,ps[0],ps[-1]) for p in ps[1:-1]]
        maximum=max(ds,default=0)
        if maximum<=epsilon:return [ps[0],ps[-1]]
        index=ds.index(maximum)+1
        return walk(ps[:index+1])[:-1]+walk(ps[index:])
    simplified=walk(points)
    return simplified if len(simplified)>=4 else points

source=json.load(open(sys.argv[1]))
features=[]
for feature in source['features']:
    geometry=feature['geometry']
    polygons=geometry['coordinates'] if geometry['type']=='MultiPolygon' else [geometry['coordinates']]
    coordinates=[[[[round(p[0],6),round(p[1],6)] for p in simplify(ring)] for ring in polygon] for polygon in polygons]
    features.append({'type':'Feature','properties':{'name':feature['properties']['boroname']},'geometry':{'type':'MultiPolygon','coordinates':coordinates}})
result={'type':'FeatureCollection','source':'https://data.cityofnewyork.us/City-Government/Borough-Boundaries/gthc-hcne','sourceVersion':'26b','description':'NYC DCP borough boundaries, shoreline clipped; generalized for display at neighborhood overview scale.','features':features}
json.dump(result,open('src/data/borough-boundaries.json','w'),separators=(',',':'))
print('Saved five borough boundaries,',sum(len(ring) for f in features for polygon in f['geometry']['coordinates'] for ring in polygon),'vertices')
